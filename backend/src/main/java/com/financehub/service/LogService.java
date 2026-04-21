package com.financehub.service;

import com.financehub.model.Log;
import com.financehub.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepository logRepository;

    public List<com.financehub.dto.LogResponse> getAll() {
        return logRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<com.financehub.dto.LogResponse> getByUserId(Long userId) {
        return logRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public void logAction(com.financehub.model.User user, String action, String details, String ipAddress, String status) {
        Log log = Log.builder()
                .user(user)
                .action(action)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "system")
                .status(status)
                .build();
        logRepository.save(log);
    }

    private com.financehub.dto.LogResponse toResponse(Log log) {
        return com.financehub.dto.LogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .action(log.getAction())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .status(log.getStatus())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
