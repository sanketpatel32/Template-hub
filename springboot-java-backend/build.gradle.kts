plugins {
  java
  id("org.springframework.boot") version "3.3.4"
  id("io.spring.dependency-management") version "1.1.6"
  id("com.diffplug.spotless") version "6.25.0"
}

group = "com.example"
version = "0.1.0"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(21)
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("io.micrometer:micrometer-registry-prometheus")
  implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
  implementation("net.logstash.logback:logstash-logback-encoder:8.0")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
  useJUnitPlatform()
}

tasks.withType<JavaCompile> {
  options.encoding = "UTF-8"
}

spotless {
  java {
    googleJavaFormat("1.23.0")
    target("src/**/*.java")
  }
  kotlinGradle {
    target("*.gradle.kts")
    ktfmt()
  }
  format("misc") {
    target("*.md", ".gitignore", ".dockerignore", ".editorconfig", ".env.example")
    trimTrailingWhitespace()
    endWithNewline()
  }
}

tasks.named("check") {
  dependsOn("spotlessCheck")
}
