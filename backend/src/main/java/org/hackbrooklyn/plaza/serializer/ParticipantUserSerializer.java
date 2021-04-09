package org.hackbrooklyn.plaza.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.hackbrooklyn.plaza.model.User;

import java.io.IOException;

/**
 * Returns select information about a team formation participant from their user data.
 */
public class ParticipantUserSerializer extends StdSerializer<User> {

    public ParticipantUserSerializer() {
        this(null);
    }

    public ParticipantUserSerializer(Class<User> t) {
        super(t);
    }

    @Override
    public void serialize(User user, JsonGenerator jsonGen, SerializerProvider provider) throws IOException {
        jsonGen.writeStartObject();
        jsonGen.writeStringField("firstName", user.getFirstName());
        jsonGen.writeStringField("lastName", user.getLastName());
        jsonGen.writeEndObject();
    }
}
