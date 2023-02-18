const express = require('express');
const { updateActivity, getAllActivities, createActivity, getActivityByName, getActivityById } = require('../db/activities');
const { getPublicRoutinesByActivity } = require('../db/routines');
const { ActivityNotFoundError, ActivityExistsError } = require('../errors');
const activitiesRouter = express.Router();


// * GET /api/activities/:activityId/routines - Passing all tests
activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
    const{ activityId } = req.params

    try {        
        const publicRoutinesByActivities = await getPublicRoutinesByActivity({id: activityId})

        if (publicRoutinesByActivities.length === 0 ) {

            next({
                error: "Activity not found",
                name: "Activity not found",
                message: ActivityNotFoundError(activityId)
            });

        } else {

           res.send(publicRoutinesByActivities) ;

        }

    } catch(error){
        next(error);
    }

})

// * GET /api/activities - Passing test
activitiesRouter.get("/", async (req, res, next) => {

    try{ 

        const allActivities = await getAllActivities();
        res.send(allActivities);

    } catch(error) {
        next(error);
    }

})

// * POST /api/activities - Passing all tests
activitiesRouter.post("/", async (req, res, next) => {
    const { name } = req.body;

    try {

        const existingActivity = await getActivityByName(name)
        
        if (existingActivity) {

            next({
                error: "Activity already exists",
                name: "Activity already exists",
                message: ActivityExistsError(name)
            });

        } else {

            const createdActivity = await createActivity(req.body);
            res.send(createdActivity);

        }

    }catch(error) {
        next(error);
    }

})

// * PATCH /api/activities/:activityId - Passing all tests
activitiesRouter.patch("/:activityId", async (req, res, next) => {
    const { activityId } = req.params

    try{

        const activityToUpdate = await getActivityById(activityId);

        if (!activityToUpdate) {

            next({
                error: "Activity to update does not exist",
                name: "Activity to update does not exist",
                message: ActivityNotFoundError(activityId)
            }); 

        } else {

            req.body.id = activityId;
            const updatedActivity = await updateActivity(req.body);
            res.send(updatedActivity);
        }

    } catch(error) {
        next(error);
    }
})

module.exports = activitiesRouter;