package egg.em.server.entities.dbEntities;

import lombok.Data;

import javax.persistence.*;
import java.util.Set;

@Data
@Entity
public class TestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    int lights;
    String result;
    String type;
    @ManyToMany
    Set<Light> devices;

    public TestEntity(int lights, String result, String type, Set<Light> devices) {
        this.lights = lights;
        this.result = result;
        this.type = type;
    }

    public long getId() {
        return id;
    }

    public int getLights() {
        return lights;
    }

    public String getResult() {
        return result;
    }

    public String getType() {
        return type;
    }

    public Set<Light> getDevices() {
        return devices;
    }
}
