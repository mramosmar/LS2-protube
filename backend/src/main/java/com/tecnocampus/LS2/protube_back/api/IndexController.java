package com.tecnocampus.LS2.protube_back.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class IndexController {

    @GetMapping(value = {"", "/"})
    public String home() {
        return "forward:/index.html";
    }

    // Maneja rutas de React Router (SPA) - redirige al index.html
    @GetMapping(value = {"/video/{videoId}/**", "/video/{videoId}"})
    public String forwardVideoRoutes() {
        return "forward:/index.html";
    }

    @PostMapping("logout")
    public String logout() {
        return "logout";
    }

}
