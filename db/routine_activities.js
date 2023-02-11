/* eslint-disable no-useless-catch */
const client = require("./client");
 
// * Passing Test
async function addActivityToRoutine({ routineId, activityId, count, duration}) {
  
  try {
    
    const {
      rows: [createdRoutineActivity] } = await client.query(
      `
        INSERT INTO routine_activities("routineId", "activityId", count, duration) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );

    return await createdRoutineActivity;
  } catch (error) {
    throw error;
  }
}

// * Passing Test
async function getRoutineActivityById(id) {

  try {
    const { rows: [routineActivity] } = await client.query(
      `
        SELECT *
        FROM routine_activities
        WHERE id=${id};
      `
    );
    
    return routineActivity;
  } catch (error) {
    throw error;
  }

}

// * Passing test
async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivityByRoutineId } = await client.query(
      `
        SELECT *
        FROM routine_activities
        WHERE "routineId"=${id};
      `
    );
    
    return routineActivityByRoutineId;
  } catch (error) {
    throw error;
  }
}

// * Passing test
async function updateRoutineActivity({ id, ...fields }) {

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');
  // returns something like this "name"=$1, "description"=$2 as a string so it ca be used below and then the Object.values replace the $1...

  try {

    if (setString.length > 0) {
      await client.query(
      `
        UPDATE routine_activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
    }
      
      
  return await getRoutineActivityById(id)
  }catch(error){
    throw error;
  }

}

// * Passing test
async function destroyRoutineActivity(id) {

  try {
    
    const { rows: [ deletedRoutineActivity ] } = await client.query(
      `
        DELETE FROM routine_activities 
        WHERE id=${id}
        RETURNING *;
      `
    ) 

    return deletedRoutineActivity;
  }catch(error) {
    throw error;
  }

}

// * Passing tests
async function canEditRoutineActivity(routineActivityId, userId) {

  try {

    const { rows: [routineActivityById] } = await client.query(
      `
        SELECT "routineId"
        FROM routine_activities
        WHERE id=${routineActivityId};
      `
    );
    
    const { rows: userWithRoutines } = await client.query(
      `
        SELECT routines.id 
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE users.id=${userId};
      `
    );
    
    const userMatch = userWithRoutines.filter((routine) => {
      if (routine.id === routineActivityById.routineId) {
        return true;
      } else {
        return false;
      }
       
    })
    
    const verifyUser = ()=> {
      if (userMatch.length === 0) {
        return false;
      }   else {
        return true;
      }
    } 
   
    return verifyUser()
  } catch (error) {
    throw error;
  }

}

module.exports = {
  addActivityToRoutine,
  getRoutineActivityById,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity
};















