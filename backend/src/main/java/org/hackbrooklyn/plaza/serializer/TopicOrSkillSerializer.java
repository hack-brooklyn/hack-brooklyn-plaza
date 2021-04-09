package org.hackbrooklyn.plaza.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.hackbrooklyn.plaza.model.TopicOrSkill;

import java.io.IOException;

public class TopicOrSkillSerializer extends StdSerializer<TopicOrSkill> {

    public TopicOrSkillSerializer() {
        this(null);
    }

    public TopicOrSkillSerializer(Class<TopicOrSkill> t) {
        super(t);
    }

    @Override
    public void serialize(TopicOrSkill topicOrSkill, JsonGenerator jsonGen, SerializerProvider provider) throws IOException {
        jsonGen.writeStartObject();
        jsonGen.writeStringField("name", topicOrSkill.getName());
        jsonGen.writeEndObject();
    }
}
