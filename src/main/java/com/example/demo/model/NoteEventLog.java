package com.example.demo.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "note_event_log")
public class NoteEventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventKey;

    @Column(nullable = false, length = 1000)
    private String eventValue;

    @Column(name = "kafka_partition", nullable = false)
    private int partition;

    @Column(name = "kafka_offset", nullable = false)
    private long offset;

    @Column(nullable = false)
    private Instant consumedAt;

    public NoteEventLog() {}

    public NoteEventLog(String eventKey, String eventValue, int partition, long offset) {
        this.eventKey = eventKey;
        this.eventValue = eventValue;
        this.partition = partition;
        this.offset = offset;
        this.consumedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getEventKey() { return eventKey; }
    public String getEventValue() { return eventValue; }
    public int getPartition() { return partition; }
    public long getOffset() { return offset; }
    public Instant getConsumedAt() { return consumedAt; }
}
