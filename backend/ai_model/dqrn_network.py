import torch.nn as nn

class DQRN(nn.Module):

    def __init__(self, input_dim, hidden_dim, num_actions):
        """
        input_dim: number of features in the input
        hidden_dim: dimension of the hidden state of the LSTM
        num_actions: how many actions the agent can take (Q-value for each action)
        """
        super(DQRN, self).__init__()

        # LSTM which processes the feature vector over time
        self.lstm = nn.LSTM(input_dim, hidden_dim, batch_first=True)

        # Fully connected final layer to map hidden_dim -> num_actions
        self.fc = nn.Linear(hidden_dim, num_actions)


    def forward(self, x, hidden=None):
        """
        x: shape tensor [batch_size, seq_len, input_dim]
        hidden: (h, c) hidden state of the LSTM (optional, if you want to preserve continuity)

        Returns:
          - q_values: tensor [batch_size, num_actions] with the Q-values
          - hidden: new updated hidden state (h, c)
        """
        # Passa x dentro l'LSTM
        out, hidden = self.lstm(x, hidden)
        # out ha forma [batch_size, seq_len, hidden_dim]

        # Prendiamo l'ultimo timestep: out[:, -1, :] => [batch_size, hidden_dim]
        out = out[:, -1, :]

        # Applichiamo la fully-connected per produrre i Q-values
        q_values = self.fc(out)  # [batch_size, num_actions]

        return q_values, hidden