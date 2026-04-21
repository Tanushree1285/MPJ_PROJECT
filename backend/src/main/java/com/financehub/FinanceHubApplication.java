package com.financehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FinanceHubApplication {

    @jakarta.annotation.PostConstruct
    public void init() {
        // Enforce IST (Asia/Kolkata) for all timestamps
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        SpringApplication.run(FinanceHubApplication.class, args);
    }
}
