package com.tecnocampus.LS2.protube_back.api;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IndexControllerTest {
    IndexController indexController = new IndexController();

    @Test
    void home() {
        assertEquals("forward:/index.html", indexController.home());
    }

    @Test
    void forwardVideoRoutes() {
        assertEquals("forward:/index.html", indexController.forwardVideoRoutes());
    }

    @Test
    void logout() {
        assertEquals("logout", indexController.logout());
    }
}