package egg.em.server.entities.requestsBodies;

import egg.em.server.entities.dbEntities.Light;
import lombok.Data;

@Data
public class Device extends Light {

    private String building;
    private int buildingsId;
    private String mqttTopicOut;
    private String mqttTopicIn;
    private int sitesId;
    private String sitesName;

    public String getBuilding() {
        return building;
    }

    public int getBuildingsId() {
        return buildingsId;
    }

    public String getMqttTopicOut() {
        return mqttTopicOut;
    }

    public String getMqttTopicIn() {
        return mqttTopicIn;
    }

    public int getSitesId() {
        return sitesId;
    }

    public String getSitesName() {
        return sitesName;
    }
}
