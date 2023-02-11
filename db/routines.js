/* eslint-disable no-useless-catch */
const client = require("./client");


async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [createdRoutine] } = await client.query(
      `
        INSERT INTO routines("creatorId", "isPublic", name, goal) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `,
      [creatorId, isPublic, name, goal]
    );

    return await createdRoutine;
  } catch (error) {
    throw error;
  }
}

// * Function not tested but working as helper function to get Routines in getAllRoutines(),
  // * getAllPublicRoutines(), getAllRoutinesByUser(),  getPublicRoutinesByUser(), getPublicRoutinesByActivity
async function getRoutineById(id) {

  try {

    const { rows: [routineById] } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName" 
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE routines.id=${id};
      `
    );

    if (routineById){
      const { rows: matchingActivity } = await client.query(
        `
          SELECT activities.id, activities.name, activities.description, routine_activities.id AS "routineActivityId", 
          routine_activities."routineId", routine_activities.duration, routine_activities.count 
          FROM activities 
          JOIN routine_activities ON routine_activities."activityId" = activities.id 
          WHERE routine_activities."routineId"=${id};
        `
      );

      routineById.activities = matchingActivity;
      return routineById;

    }
    
  } catch (error) {
    throw error;
  }
}

// * Manually tested and working
async function getRoutinesWithoutActivities() {
  try {
    const { rows: routinesWithoutActivities } = await client.query(
      `
        SELECT *
        FROM routines;
      `
    );
    
    return routinesWithoutActivities;

  } catch (error) {
    throw error;
  }
}

// * Passing all tests 
async function getAllRoutines() {
  try {

    const { rows: routineId } = await client.query(
      `
        SELECT id
        FROM routines;
      `
    );

    const routines = await Promise.all(
      routineId.map((routine) => getRoutineById(routine.id))
    );
      
    return routines;

  } catch (error) {
    throw error;
  }
}

// * Passing all tests
async function getAllPublicRoutines() {

  try {

    const { rows: routineId } = await client.query(
      `
        SELECT id
        FROM routines
        WHERE "isPublic"=true
      `
    );

    const routines = await Promise.all(
      routineId.map((routine) => getRoutineById(routine.id))
    );
      
    return routines;

  } catch (error) {
    throw error;
  }

}

// * Passing all tests
async function getAllRoutinesByUser({ username }) {
  try {

    const { rows: routineId } = await client.query(
      `
      SELECT routines.id
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE users.username='${username}';
      `
    );

    const routines = await Promise.all(
      routineId.map((routine) => getRoutineById(routine.id))
    );
      
    return routines;

  } catch (error) {
    throw error;
  }

}

// * Passing all tests
async function getPublicRoutinesByUser({ username }) {
  try {

    const { rows: routineId } = await client.query(
      `
      SELECT routines.id
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE users.username='${username}' AND routines."isPublic"=true
      `
    );

    const routines = await Promise.all(
      routineId.map((routine) => getRoutineById(routine.id))
    );

    return routines;

  } catch (error) {
    throw error;
  }
   
}

//* Passing all tests
async function getPublicRoutinesByActivity({ id }) {

  try {

    const { rows: routineIdByActivityId } = await client.query(
      `
        SELECT routine_activities."routineId"
        FROM activities 
        JOIN routine_activities ON routine_activities."activityId" = activities.id 
        WHERE activities.id=${id};
      `
    );    

    const allRoutinesByActivityId = await Promise.all(
      routineIdByActivityId.map((routine) => getRoutineById(routine.routineId))
    );

    const publicRoutinesByActivityId = await allRoutinesByActivityId.filter(
      (routine) => {
        if (routine.isPublic === true) {
          return true;
        } else {
          return false;
        }
      }
    );
     
    return publicRoutinesByActivityId;
  } catch (error) {
    throw error;
  }
   
}

// * Passing all tests
async function updateRoutine({ id, ...fields }) {


  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');
  // returns something like this "isPublic"=$1, "name"=$2, "goal"=$3 so it ca be used below and then the Object.values replace the $1...

  try {
    if (setString.length > 0) {
      await client.query(
      `
        UPDATE routines
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
    }
    
    
  return await getRoutineById(id)
  }catch(error){
    throw error 
  }
}

// * Passing all tests
async function destroyRoutine(id) {

  try {

    await client.query(
      `
        DELETE FROM routine_activities
        WHERE "routineId"=${id}
        RETURNING *;
      `
    ) 

    const { rows: [deletedRoutine] } = await client.query(
      `
      DELETE FROM routines 
      WHERE id=${id}
      RETURNING *;
      `
    )

   return deletedRoutine;
  }catch(error) {
    throw error;
  }

}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine
};



