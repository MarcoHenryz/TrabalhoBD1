package com.uel.config;

import java.util.Map;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoCors implements WebMvcConfigurer {
  private final Map<String, String> env = System.getenv();

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    String origin = env.getOrDefault("FRONT_URL", "*");
    registry.addMapping("/**")
        .allowedOriginPatterns(origin.equals("*") ? "*" : origin)
        .allowedMethods("*")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
