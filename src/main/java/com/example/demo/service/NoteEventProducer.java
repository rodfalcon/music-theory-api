package com.example.demo.service;

import com.example.demo.dto.NoteEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NoteEventProducer {
    private static final Logger log = LoggerFactory.getLogger(NoteEventProducer.class);
    private static final String TOPIC = "note-events";

    private final KafkaTemplate<String, String> kafkaTemplate;

    public NoteEventProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(NoteEvent noteEvent) {
        String payload = String.format("{\"type\": \"%s\", \"root\": \"%s\", \"scale\": \"%s\", \"timestamp\": %d}", noteEvent.type(), noteEvent.root(), noteEvent.scale(), noteEvent.timestamp());
        kafkaTemplate.send(TOPIC, noteEvent.root(), payload)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish to {}: {}", TOPIC, ex.getMessage());
                } else {
                    log.info("Published to {} partition={} offset={}: {}",
                        TOPIC,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        payload);
                }
            });
    }
}