package egg.em.server.entities.dbEntities;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity(name = "sensors")
public class Sensor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String type;
    @Column(name = "parent_id")
    private Light parent;
    private String nodeId;
    private int levelsId;
    private boolean isAssigned;
    private int fpCoordinatesLeft;
    private int fpCoordinatesBot;
}
