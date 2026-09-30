classDiagram
    class NetworkSniffer {
        -packet_queue : Queue
        -stop_event : Event
        -parser : PacketParser
        -analyzer : ThreatAnalyzer
        +start()
        -_producer_loop()
        -_consumer_worker(worker_id)
        -_shutdown()
    }
    class PacketParser {
        +ETH_STRUCT : Struct
        +IPV4_STRUCT : Struct
        +parse_packet(raw_data) dict
        +unpack_ethernet(data)
        +unpack_ipv4(data)
        +unpack_tcp(data)
    }
    class ThreatAnalyzer {
        -lock : Lock
        -stats : dict
        -syn_tracker : dict
        +analyze_batch(local_stats, syn_ips)
        +get_summary() dict
    }

    NetworkSniffer --> PacketParser : usa
    NetworkSniffer --> ThreatAnalyzer : invia batch a