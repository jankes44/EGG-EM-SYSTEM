package egg.em.server.entities.liveEntities;

import egg.em.server.entities.dbEntities.Sensor;
import egg.em.server.entities.requestsBodies.Device;

import java.util.HashSet;
import java.util.Set;

public class TestDevice {

    private int powerCut;
    private boolean clicked;
    private long duration;
    private long durationStart;
    private long user;
    private Set<String> result;
    private Set<Sensor> sensors;
    private long testId;
    private String nodeId;

    public TestDevice(long user, long testId, String nodeId, Set<Sensor> sensors) {
        this.nodeId = nodeId;
        this.powerCut = 0;
        this.clicked = false;
        this.duration = 0;
        this.duration = 0;
        this.result = new HashSet<>();
        this.user = user;
        this.testId = testId;
        this.sensors = sensors;
    }
}
