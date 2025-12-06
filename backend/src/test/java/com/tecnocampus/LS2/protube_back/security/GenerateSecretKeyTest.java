package com.tecnocampus.LS2.protube_back.security;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

class GenerateSecretKeyTest {

    @Test
    void shouldGenerateSecretKey() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outputStream));

        try {
            GenerateSecretKey.main(new String[]{});

            String output = outputStream.toString();
            assertTrue(output.contains("Your secret key:"));
        } finally {
            System.setOut(originalOut);
        }
    }

    @Test
    void shouldGenerateBase64EncodedKey() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outputStream));

        try {
            GenerateSecretKey.main(new String[]{});

            String output = outputStream.toString().trim();
            String key = output.replace("Your secret key: ", "");

            // Base64 encoded 32 bytes should be 44 characters (with padding)
            assertTrue(key.length() >= 40);
        } finally {
            System.setOut(originalOut);
        }
    }

    @Test
    void shouldGenerateUniqueKeys() {
        ByteArrayOutputStream outputStream1 = new ByteArrayOutputStream();
        ByteArrayOutputStream outputStream2 = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;

        try {
            System.setOut(new PrintStream(outputStream1));
            GenerateSecretKey.main(new String[]{});
            String key1 = outputStream1.toString().replace("Your secret key: ", "").trim();

            System.setOut(new PrintStream(outputStream2));
            GenerateSecretKey.main(new String[]{});
            String key2 = outputStream2.toString().replace("Your secret key: ", "").trim();

            assertNotEquals(key1, key2);
        } finally {
            System.setOut(originalOut);
        }
    }
}

