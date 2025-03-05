from ai_model.replay_memory import ReplayMemory


BATCH_SIZE = 32
ONLINE_UPDATE_FREQ = 200
TARGET_UPDATE_FREQ = 10
replay_memory = ReplayMemory(capacity=2000)

class WebTrainer:
    """
    Trainer to use in n a real-time environment.
    Stores a single transition in the replay memory and, if enough transitions
    have been accumulated, performs a mini-batch update.

    """

    def __init__(self, agent):
        self.agent = agent
        self.buffer = replay_memory
        self.batch_size = BATCH_SIZE
        self.online_update_freq = ONLINE_UPDATE_FREQ
        self.target_update_freq = TARGET_UPDATE_FREQ
        self.train_steps = 0

    def handle_transition(self, transition):
        # Accumula transizione
        self.buffer.push(transition)
        print("transition pushed in buffer. Buffer dim:", len(self.buffer))

        if len(self.buffer) >= self.online_update_freq:
            batch = self.buffer.pop_last(self.online_update_freq)  # Prendi esattamente online_update_freq transizioni, e rimuovile dal buffer
            if self.train_steps % self.target_update_freq == 0:
                loss = self.agent.update(batch, update_target=True)
                print(f"Update TARGET net triggered, loss = {loss}")
            else:
                loss = self.agent.update(batch)
                print(f"Update ONLINE net triggered, loss = {loss}")
            self.train_steps += 1


# class Trainer:
#     def __init__(
#             self,
#             agent,
#             env,
#             replay_memory,
#             batch_size=32,
#             target_update_freq=1000,
#             episodes=1000,
#             max_steps_per_episode=1000
#     ):
#         """
#         agent: un oggetto che incapsula la rete (DQRN) e la logica di update
#         env:   l'ambiente (stile Gym) o un environment custom
#         replay_memory: una classe con push(sample) (opzionale, se usi replay)
#         batch_size: dimensione del batch per l’update
#         target_update_freq: ogni quante iterazioni di training aggiornare la rete target
#         episodes: numero di episodi (iterazioni principali)
#         max_steps_per_episode: limite step per episodio (se esiste un concetto di step)
#         """
#         self.agent = agent
#         self.env = env
#         self.replay_memory = replay_memory
#         self.batch_size = batch_size
#         self.target_update_freq = target_update_freq
#         self.episodes = episodes
#         self.max_steps_per_episode = max_steps_per_episode
#
#         self.train_steps = 0  # contatore di quante volte chiamiamo agent.update()
#
#     def run_training(self, epsilon_start=1.0, epsilon_end=0.01, epsilon_decay=0.995):
#         """
#         Esegue il ciclo di allenamento principale per un numero di episodi definito.
#         Gestisce la decrescita di epsilon, se usi epsilon-greedy.
#         """
#         epsilon = epsilon_start
#
#         for ep in range(1, self.episodes + 1):
#             total_reward = self.run_episode(epsilon)
#             print(f"[Episode {ep}/{self.episodes}] Reward: {total_reward:.2f}, Epsilon: {epsilon:.3f}")
#
#             # Aggiorna epsilon
#             epsilon = max(epsilon_end, epsilon * epsilon_decay)

    # def run_episode(self, epsilon):
    #     """
    #     Esegue un singolo episodio:
    #      - resetta l’ambiente
    #      - esegue step finché non done o superato il max_steps
    #      - accumula transizioni in replay
    #      - chiama agent.update() ogni volta che abbiamo batch a sufficienza
    #     """
    #     state = self.env.reset()
    #     self.agent.reset_hidden()
    #
    #     total_reward = 0.0
    #     done = False
    #     step_count = 0
    #
    #     while not done and step_count < self.max_steps_per_episode:
    #         step_count += 1
    #
    #         # 1. Selezioniamo un’azione via epsilon-greedy
    #         action_idx = self.agent.select_action(state, epsilon)
    #
    #         # 2. Eseguiamo l’azione nell’ambiente
    #         next_state, reward, done, info = self.env.step(action_idx)
    #
    #         total_reward += reward
    #
    #         # 3. Memorizziamo la transizione
    #         self.replay_memory.push(state, action_idx, reward, next_state, done)
    #
    #         # 4. Prepariamo per lo step successivo
    #         state = next_state
    #
    #         # 5. Aggiorniamo la rete se abbiamo abbastanza campioni
    #         if len(self.replay_memory) >= self.batch_size:
    #             batch = self.replay_memory.sample(self.batch_size)
    #             loss = self.agent.update(batch)
    #             self.train_steps += 1
    #
    #             # Se stai usando un target net, potresti aggiornarla ogni tot step
    #             if self.train_steps % self.target_update_freq == 0:
    #                 self.agent.update_target()
    #
    #     return total_reward


