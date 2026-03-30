package com.financehub.controller;

import com.financehub.model.Log;
import com.financehub.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping("/all")
    public ResponseEntity<List<com.financehub.dto.LogResponse>> getAll() {
        return ResponseEntity.ok(logService.getAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<com.financehub.dto.LogResponse>> getByUser(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(logService.getByUserId(userId));
    }
}
