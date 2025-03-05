from collections import deque

class ReplayMemory:
    """
        To save transitions and batch sample.
        capacity limit the number of transitions saved.
    """
    def __init__(self, capacity):
        self.capacity = capacity
        self.memory = deque(maxlen=capacity)

    def __len__(self):
        return len(self.memory)

    def push(self, transition):
        self.memory.append(transition)

    def clear(self):
        """Svuota completamente il buffer."""
        self.memory.clear()


    def pop_last(self, n):
        """
        Rimuove e restituisce le ultime n transizioni in ordine cronologico.
        Se n è maggiore del numero di transizioni presenti, ne restituisce tutte.
        """
        n = min(n, len(self.memory))
        samples = []
        for _ in range(n):
            samples.append(self.memory.pop())
        # pop() rimuove dalla fine, quindi invertiamo l'ordine per ripristinare la sequenza originale
        return samples[::-1]
