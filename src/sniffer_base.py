import socket

# Costante Linux ETH_P_ALL (3) per catturare tutti i protocolli di rete
ETH_P_ALL = 3 

def avvia_sniffer():
    try:
        raw_socket = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(ETH_P_ALL))
        print("Sniffer in ascolto... (Premi Ctrl+C per interrompere)")

        while True:
            raw_data, address = raw_socket.recvfrom(65535)
            
            print(f"Interfaccia/MAC: {address} | Dati (Hex): {raw_data[:14].hex()}")

    except PermissionError:
        print("Errore critico: Privilegi insufficienti. Esegui lo script con 'sudo'.")
    except KeyboardInterrupt:
        print("\nAcquisizione terminata dall'utente.")

if __name__ == "__main__":
    avvia_sniffer()