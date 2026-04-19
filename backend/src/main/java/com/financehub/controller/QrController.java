package com.financehub.controller;

import com.financehub.service.QrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;

    @GetMapping("/my")
    public ResponseEntity<Map<String, String>> getMyQr() {
        String qrBase64 = qrService.generateMyQr();
        return ResponseEntity.ok(Map.of("qrCode", qrBase64));
    }
}
