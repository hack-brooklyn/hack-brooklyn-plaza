package org.hackbrooklyn.plaza.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class LocalDateTimeWithUTCSerializer extends StdSerializer<LocalDateTime> {

    protected LocalDateTimeWithUTCSerializer(Class<LocalDateTime> t) {
        super(t);
    }

    protected LocalDateTimeWithUTCSerializer() {
        this(null);
    }

    @Override
    public void serialize(LocalDateTime localDateTime, JsonGenerator generator, SerializerProvider provider) throws IOException {
        ZonedDateTime zonedDateTime = localDateTime.atZone(ZoneOffset.UTC);
        generator.writeString(zonedDateTime.format(DateTimeFormatter.ISO_DATE_TIME));
    }
}
