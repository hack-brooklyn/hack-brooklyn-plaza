package org.hackbrooklyn.plaza.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@RunWith(SpringJUnit4ClassRunner.class)
@AutoConfigureMockMvc
@WebAppConfiguration
public class ApplyTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void shouldSubmitApplicationWithRequiredFields() throws Exception {
        SubmittedApplication application = new SubmittedApplication();

        application.setFirstName("John");
        application.setLastName("Doe");
        application.setEmail("johndoe@example.com");
        application.setCountry("United States");
        application.setSchool("Brooklyn College");
        application.setLevelOfStudy("Junior/3rd Year");
        application.setGraduationYear(2022);
        application.setAcceptTocAndCoc(true);

        ObjectMapper mapper = new ObjectMapper();
        String reqBody = mapper.writeValueAsString(application);

        MockMultipartFile resBodyMultipart = new MockMultipartFile(
                "formDataJson",
                "formDataJson",
                "application/json",
                reqBody.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/apply")
                .file(resBodyMultipart)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
