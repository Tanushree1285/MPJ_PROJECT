package com.financehub.utils;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class BCryptTest {
    @Test
    public void generateHashes() throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String[] pwds = {"john1234", "jane456", "emp789", "admin000", "audit999", "roshni111"};
        List<String> lines = new ArrayList<>();
        for (String p : pwds) {
            lines.add(p + ":" + encoder.encode(p));
        }
        Files.write(Paths.get("hashes_final.txt"), lines);
    }
}
