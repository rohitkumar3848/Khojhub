package com.khojhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class KhojHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(KhojHubApplication.class, args);
    }
}
