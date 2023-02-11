const express = require('express');
const { canEditRoutineActivity, updateRoutineActivity, getRoutineById, getRoutineActivityById, destroyRoutineActivity } = require('../db');
const { UnauthorizedUpdateError, UnauthorizedDeleteError } = require('../errors');
const { requireUser } = require('./utils');
const routineActivitiesRouter = express.Router();

// * PATCH /api/routine_activities/:routineActivityId - Passing all tests
routineActivitiesRouter.patch("/:routineActivityId", requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { id, username } = req.user

        
    try {
        const isAuthorized = await canEditRoutineActivity(routineActivityId, id)
    
        if (isAuthorized) {      

            req.body.id = routineActivityId;
            const updatedRoutineActivity = await updateRoutineActivity(req.body);
            res.send(updatedRoutineActivity);
                
        } else {
                
            const routine_activity = await getRoutineActivityById(routineActivityId);
            const {routineId} = routine_activity;
            const associatedRoutineName = await getRoutineById(routineId);
            const {name} = associatedRoutineName;
            
            res.status(403);
    
            next({
                error: "Not authorized to update",
                name: "Not authorized to update",
                message: UnauthorizedUpdateError(username, name)
            });
        }
    
    } catch(error) {
        next(error);
    }
    
})

// * DELETE /api/routine_activities/:routineActivityId - Passing all tests
routineActivitiesRouter.delete("/:routineActivityId", requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { id, username } = req.user

        
    try {
        const isAuthorized = await canEditRoutineActivity(routineActivityId, id)
    
        if (isAuthorized) {      

            const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId);
            res.send(deletedRoutineActivity);
                
        } else {
                
            const routine_activity = await getRoutineActivityById(routineActivityId);
            const {routineId} = routine_activity;
            const associatedRoutineName = await getRoutineById(routineId);
            const {name} = associatedRoutineName;
            
            res.status(403);
    
            next({
                error: "Not authorized to delete",
                name: "Not authorized to delete",
                message: UnauthorizedDeleteError(username, name)
            });
        }
    
    } catch(error) {
        next(error);
    }


    
})


module.exports = routineActivitiesRouter;


