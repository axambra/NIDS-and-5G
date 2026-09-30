import logging
from logging.handlers import RotatingFileHandler

class AlertLogger:
    def __init__(self, filepath="alerts.json", max_bytes=5*1024*1024, backup_count=3):
        self.log_queue = queue.Queue()
        self.stop_event = threading.Event()
        
        # Configurazione del logger rotativo nativo di Python
        self.file_logger = logging.getLogger("NIDS_Alerts")
        self.file_logger.setLevel(logging.INFO)
        
        # Evita duplicazioni di handler se la classe viene istanziata più volte
        if not self.file_logger.handlers:
            handler = RotatingFileHandler(filepath, maxBytes=max_bytes, backupCount=backup_count)
            # Il formatter inserisce solo il messaggio (che sarà il nostro JSON dumpato) senza prefissi
            handler.setFormatter(logging.Formatter('%(message)s'))
            self.file_logger.addHandler(handler)

        self.writer_thread = threading.Thread(
            target=self._async_writer, 
            name="AlertWriter", 
            daemon=True
        )
        self.writer_thread.start()

    def _async_writer(self):
        """Preleva dalla coda e delega la scrittura al RotatingFileHandler."""
        while not self.stop_event.is_set() or not self.log_queue.empty():
            try:
                alert_data = self.log_queue.get(timeout=0.5)
                # Il logger gestisce in automatico l'apertura, la chiusura e la rotazione dei file
                self.file_logger.info(json.dumps(alert_data))
                self.log_queue.task_done()
            except queue.Empty:
                continue

    def log_alert(self, src_ip, dst_ip, attack_type, severity):
        alert_data = {
            "timestamp": datetime.now().isoformat(),
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "attack_type": attack_type,
            "severity": severity
        }
        self.log_queue.put(alert_data)

    def shutdown(self):
        self.stop_event.set()
        self.writer_thread.join()