package com.example.demo.service;

import com.example.demo.model.NoteEventLog;
import com.example.demo.repository.NoteEventLogRepository;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NoteEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NoteEventConsumer.class);
    private final NoteEventLogRepository repo;

    public NoteEventConsumer(NoteEventLogRepository repo) {
        this.repo = repo;
    }

    @KafkaListener(topics = "note-events", groupId = "music-theory-api")
    public void consume(ConsumerRecord<String, String> record) {
        log.info("Consumed event - Key: {}, Value: {}, partition: {}, offset: {}",
                record.key(), record.value(), record.partition(), record.offset());
        repo.save(new NoteEventLog(record.key(), record.value(), record.partition(), record.offset()));
    }
}
