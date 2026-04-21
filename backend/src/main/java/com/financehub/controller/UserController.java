package com.financehub.controller;

import com.financehub.dto.UpdateUserRequest;
import com.financehub.dto.UserResponse;
import com.financehub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable("id") Long id,
                                               @RequestBody UpdateUserRequest request,
                                               jakarta.servlet.http.HttpServletRequest httpRequest) {
        return ResponseEntity.ok(userService.updateProfile(id, request, getClientIp(httpRequest)));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deactivate(@PathVariable("id") Long id,
                                                          jakarta.servlet.http.HttpServletRequest httpRequest) {
        userService.deactivate(id, getClientIp(httpRequest));
        return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable("id") Long id,
                                                   @RequestParam("roleName") String roleName,
                                                   jakarta.servlet.http.HttpServletRequest httpRequest) {
        return ResponseEntity.ok(userService.updateRole(id, roleName, getClientIp(httpRequest)));
    }

    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) return xf.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
