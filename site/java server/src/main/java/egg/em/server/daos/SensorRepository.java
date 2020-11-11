package egg.em.server.daos;

import egg.em.server.entities.dbEntities.Sensor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface SensorRepository {
    @Query("from Sensor s where s.parent_id=:parentId")
    Set<Sensor> findByParentId(@Param("parentId") long parentId);

}
