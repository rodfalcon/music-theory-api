package com.example.demo.repository;

import com.example.demo.model.NoteEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteEventLogRepository extends JpaRepository<NoteEventLog, Long> {
    List<NoteEventLog> findTop10ByOrderByConsumedAtDesc();
}
