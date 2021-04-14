package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class NotificationContentDTO {

    private String title;
    private String body;
    private String tag;
    private boolean renotify;
    private boolean silent;
}
