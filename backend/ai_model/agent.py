import random

import torch
from torch import optim, nn

from ai_model.dqrn_network import DQRN
import json
from preprocessing import FEATURE_VECTOR_LENGTH


def load_actions():
    with open("actions.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

ACTIONS = load_actions()
OUTPUT_DIM = len(ACTIONS)

NUM_FEATURES = 7
HIDDEN_DIM = 16
INPUT_DIM = FEATURE_VECTOR_LENGTH

LR = 1e-3
GAMMA = 0.99
EPSILON = 0.1

class DQRNModel:
    def __init__(self, device='cpu'):
        """
        input_dim: feature vector dimension
        hidden_dim: LSTM hidden state dimension
        num_actions: how many actions the agent can take
        device: 'cpu' or 'cuda'
        """
        self.gamma = GAMMA
        self.hidden = None  # (h, c) => initial hidden state
        self.num_actions = OUTPUT_DIM
        self.device = device

        self.online_net = DQRN(INPUT_DIM, HIDDEN_DIM, OUTPUT_DIM).to(device)

        # Target network with the same architecture, to stabilize learning
        self.target_net = DQRN(INPUT_DIM, HIDDEN_DIM, OUTPUT_DIM).to(device)
        self.target_net.load_state_dict(self.online_net.state_dict())
        self.target_net.eval()

        # Optimizer and loss function
        self.optimizer = optim.Adam(self.online_net.parameters(), lr=LR)
        self.criterion = nn.SmoothL1Loss()

    def select_action(self, feature_vector):
        """
        Select action with epsilon-greedy:
          - Converts feature_vector to a tensor [1, 1, input_dim].
          - Propagates in the network + hidden
          - Returns the action with the highest Q-value
        """
        if random.random() < EPSILON:
            # random
            action_idx = random.randint(0, self.num_actions - 1)
        else:
            # greedy
            with torch.no_grad():

                # 1. Converts feature_vector to PyTorch tensor, float32
                # and adds dimensions (batch=1, seq_len=1)
                x = torch.tensor(feature_vector, dtype=torch.float32, device=self.device)
                x = x.unsqueeze(0).unsqueeze(0)  # shape => [1, 1, input_dim]

                # 2. Pass x in the network
                q_values, self.hidden = self.online_net(x, self.hidden) # shape => [1, num_actions]

                # 3. Argmax to find the index of the action with the largest Q-value
                # TODO: if the banner is already shown, don't show it again
                action_idx = q_values.argmax(dim=1).item()

        # 4. mapping index to an action name
        return ACTIONS[action_idx]

    def update(self, batch, target_update=False):
        """
        Executes an update step on a given mini-batch of transitions:
          batch: [(s, a, r, s_next, done), ...] with batch_size
        target_update: if True, updates the target network (in the next pass).
        """
        # 1. extract tensors from the batch
        states, actions, rewards, next_states, dones = self._prepare_batch_tensors(batch)
        # 2. calculate Q(s, a) with the online network
        q_values, _ = self.online_net(states)  # shape => [batch_size, num_actions]
        # indexes the Q-values with the actions taken
        q_values = q_values.gather(1, actions.unsqueeze(1)).squeeze(1)  # => [batch_size]

        # 3. Calculate target Q(s', a') with the target network
        with torch.no_grad():
            q_next, _ = self.target_net(next_states)
            q_next_max = q_next.max(dim=1)[0]  # => [batch_size]
            q_next_max[dones] = 0.0  # if done, target = r (because there is no next state)

        targets = rewards + self.gamma * q_next_max

        # 4. loss calculation
        loss = self.criterion(q_values, targets)

        # 5. Backprop and optimization
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # 6. soft/hard update of the target network
        if target_update:
            self.target_net.load_state_dict(self.online_net.state_dict())

        return loss.item()

    def _prepare_batch_tensors(self, batch):
        # Converte le transizioni in tensori PyTorch
        # Batch = [(s, a, r, s_next, done), ...]
        states = []
        actions = []
        rewards = []
        next_states = []
        dones = []
        for (s, a, r, s_next, d) in batch:
            states.append(s)
            actions.append(a)
            rewards.append(r)
            next_states.append(s_next)
            dones.append(d)
        states = torch.tensor(states, dtype=torch.float32, device=self.device)  # shape => [B, input_dim]
        next_states = torch.tensor(next_states, dtype=torch.float32, device=self.device)
        actions = torch.tensor(actions, dtype=torch.long, device=self.device)
        rewards = torch.tensor(rewards, dtype=torch.float32, device=self.device)
        dones = torch.tensor(dones, dtype=torch.bool, device=self.device)
        # reshaping per LSTM => [batch_size, seq_len=1, input_dim]
        states = states.unsqueeze(1)
        next_states = next_states.unsqueeze(1)
        return states, actions, rewards, next_states, dones


    def reset_hidden(self):
        """ Resets the internal state of the LSTM (useful at the beginning of the episode or session)."""
        self.hidden = None

    def save_weights(self, path, overwrite=True):
        # TODO: timestep in the filename yes/no? How to load it next?
        if not overwrite:
            import time
            timestamp = int(time.time())
            path = f"{path}_{timestamp}.pt"
        torch.save(self.online_net.state_dict(), path)

    def load_weights(self, path):
        state_dict = torch.load(path, map_location=self.device)
        self.online_net.load_state_dict(state_dict)
        self.target_net.load_state_dict(state_dict)

