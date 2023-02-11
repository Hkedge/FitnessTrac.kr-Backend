/* eslint-disable no-useless-catch */
const client = require('./client');

// * Passing all tests 
async function createActivity({ name, description }) {

  try {

    const {
      rows: [createdActivity],
    } = await client.query(
      `
        INSERT INTO activities(name, description) 
        VALUES($1, $2) 
        RETURNING *;
      `,
      [name, description]
    );

    return await createdActivity;
  } catch (error) {
    throw error;
  }
}

// * Passing all tests
async function getAllActivities() {
  try {

    const { rows: activities } = await client.query(
      `
        SELECT *
        FROM activities;
      `
    )
      
    return activities;
  } catch (error) {
    throw error;
  }
}

// * Passing all tests 
async function getActivityById(id) {

  try {

    const { rows: [activity] } = await client.query(
      `
        SELECT *
        FROM activities
        WHERE id=$1;
      `, [id]
    );
    
    return activity;
  } catch (error) {
    throw error;
  }
  
}

// * Passing all tests
async function getActivityByName(name) {
  try {

    const {
      rows: [activity],
    } = await client.query(
      `
        SELECT *
        FROM activities
        WHERE name=$1;
      `,
      [name]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}


// * I opted not to use this helper function instead using the getRoutinesById() as my helper function like they modeled in juiceBox
// async function attachActivitiesToRoutines(routines) {
// }


//* Passing all tests 
  // don't try to update the id
  // do update the name and description
  // return the updated activity
async function updateActivity({ id, ...fields }) {

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');
  // returns something like this "name"=$1, "description"=$2 as a string so it ca be used below and then the Object.values replace the $1...

  try {

    if (setString.length > 0) {
      await client.query(
      `
        UPDATE activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
    }
      
      
  return await getActivityById(id)
  }catch(error){
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  createActivity,
  updateActivity,
};




















