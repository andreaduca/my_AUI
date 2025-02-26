from db.sessions_repository import save_session
from db.transitions_repository import save_transition, get_transition, list_transitions

# 1. Salva una transizione
transitions = save_transition("sess_ABC", 1, [0.1, 0.2], 0, [0.3, 0.4], 1.0, False)
print("Inserted transition:", transitions)

# 2. Recupera la transizione
doc = get_transition("sess_ABC", 1)
print("Retrieved doc:", doc)

# 3. Mostra la lista di TUTTE le transizioni
all_docs = list_transitions()
print("All transitions in the DB:")
for d in all_docs:
    print(d)

result = save_session("sess_ABC")
print("Inserted session:", result)
