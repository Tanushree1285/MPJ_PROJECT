package com.financehub.service;

import com.financehub.dto.UpdateUserRequest;
import com.financehub.dto.UserResponse;
import com.financehub.exception.DuplicateUserException;
import com.financehub.exception.ResourceNotFoundException;
import com.financehub.model.Role;
import com.financehub.model.User;
import com.financehub.repository.RoleRepository;
import com.financehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LogService logService;

    public UserResponse getById(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateUserRequest request, String ipAddress) {
        User user = findUser(id);

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateUserException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        user = userRepository.save(user);

        // Log profile update
        logService.logAction(user, "PROFILE_UPDATE", "User updated their profile details", ipAddress, "SUCCESS");

        return toResponse(user);
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(UserService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivate(Long id, String ipAddress) {
        User user = findUser(id);
        user.setIsActive(false);
        userRepository.save(user);

        // Log deactivation
        logService.logAction(user, "USER_DEACTIVATED", "User account deactivated", ipAddress, "SUCCESS");
    }

    @Transactional
    public UserResponse updateRole(Long id, String roleName, String ipAddress) {
        User user = findUser(id);
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.setRole(role);
        user = userRepository.save(user);

        // Log role update
        logService.logAction(user, "ROLE_UPDATED", "User role updated to: " + roleName, ipAddress, "SUCCESS");

        return toResponse(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().getRoleName() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
