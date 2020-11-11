package egg.em.server.entities.dbEntities;

import lombok.Data;
import lombok.Getter;

import javax.persistence.*;

@Data
@Getter
@Entity
public class Light {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String nodeId;
    private int deviceId;
    private String type;
    private String status;
    private int fpCoordinatesLeft;
    private int fpCoordinatesBot;
    private boolean isAssigned;
    private int levelsId;
    private int levelsBuildingsId;
    private String comment;

    public Light() {
    }

    public Light(long id) {
        this.id = id;
    }

    public long getId() {
        return id;
    }

    public String getNodeId() {
        return nodeId;
    }

    public int getDeviceId() {
        return deviceId;
    }

    public String getType() {
        return type;
    }

    public String getStatus() {
        return status;
    }

    public int getFpCoordinatesLeft() {
        return fpCoordinatesLeft;
    }

    public int getFpCoordinatesBot() {
        return fpCoordinatesBot;
    }

    public boolean isAssigned() {
        return isAssigned;
    }

    public int getLevelsId() {
        return levelsId;
    }

    public int getLevelsBuildingsId() {
        return levelsBuildingsId;
    }

    public String getComment() {
        return comment;
    }
}
