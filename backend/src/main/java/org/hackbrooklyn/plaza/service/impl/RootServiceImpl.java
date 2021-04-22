package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.ChecklistLinksDTO;
import org.hackbrooklyn.plaza.service.RootService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RootServiceImpl implements RootService {

    @Value("${DISCORD_URL}")
    private String DISCORD_URL;

    @Value("${DEVPOST_URL}")
    private String DEVPOST_URL;

    @Value("${GUIDE_URL}")
    private String GUIDE_URL;

    @Override
    public ChecklistLinksDTO getChecklistLinks() {
        return new ChecklistLinksDTO(DISCORD_URL, DEVPOST_URL, GUIDE_URL);
    }
}
