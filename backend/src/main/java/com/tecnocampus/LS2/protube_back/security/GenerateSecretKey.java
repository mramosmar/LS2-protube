package com.tecnocampus.LS2.protube_back.security;

import java.security.SecureRandom;
import java.util.Base64;

public class GenerateSecretKey {
    public static void main(String[] args) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32]; // 256 bits
        random.nextBytes(bytes);
        String key = Base64.getEncoder().encodeToString(bytes);
        System.out.println("Your secret key: " + key);
    }
}