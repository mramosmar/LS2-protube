package com.tecnocampus.LS2.protube_back.security;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

class TokenTest {

    @Test
    void shouldGenerateAndValidateToken() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outputStream));

        try {
            Token.main(new String[]{});

            String output = outputStream.toString();
            assertTrue(output.contains("Generated Token:"));
            assertTrue(output.contains("Is Token Valid? true"));
            assertTrue(output.contains("Token Subject: user@example.com"));
            assertTrue(output.contains("Is Invalid Token Valid? false"));
        } finally {
            System.setOut(originalOut);
        }
    }

    @Test
    void shouldPrintTokenDetails() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outputStream));

        try {
            Token.main(new String[]{});

            String output = outputStream.toString();
            assertNotNull(output);
            assertFalse(output.isEmpty());
        } finally {
            System.setOut(originalOut);
        }
    }

    @Test
    void shouldValidateTokenSubject() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outputStream));

        try {
            Token.main(new String[]{});

            String output = outputStream.toString();
            assertTrue(output.contains("user@example.com"));
        } finally {
            System.setOut(originalOut);
        }
    }
}

