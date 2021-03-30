package org.hackbrooklyn.plaza.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.hackbrooklyn.plaza.model.TopicOrSkill;

import java.io.IOException;
import java.util.Set;

/**
 * Serializes a `Set` of `TopicOrSkill`s into a JSON array.
 */
public class TopicOrSkillSetSerializer extends StdSerializer<Set<TopicOrSkill>> {

    public TopicOrSkillSetSerializer() {
        this(null);
    }

    public TopicOrSkillSetSerializer(Class<Set<TopicOrSkill>> t) {
        super(t);
    }

    @Override
    public void serialize(Set<TopicOrSkill> topicsAndSkills, JsonGenerator jsonGen, SerializerProvider provider) throws IOException {
        jsonGen.writeStartArray(topicsAndSkills.size());

        for (TopicOrSkill topicOrSkill : topicsAndSkills) {
            jsonGen.writeString(topicOrSkill.getName());
        }

        jsonGen.writeEndArray();
    }
}
