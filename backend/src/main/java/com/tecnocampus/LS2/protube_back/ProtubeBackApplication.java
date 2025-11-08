package com.tecnocampus.LS2.protube_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class ProtubeBackApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProtubeBackApplication.class, args);
    }
}