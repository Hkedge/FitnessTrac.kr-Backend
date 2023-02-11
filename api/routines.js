const express = require('express');
const { getAllPublicRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine, addActivityToRoutine } = require('../db');
const { UnauthorizedUpdateError, UnauthorizedDeleteError, DuplicateRoutineActivityError } = require('../errors');
const { requireUser } = require('./utils');
const routinesRouter = express.Router();



// * GET /api/routines - Passing test
routinesRouter.get("/", async (req, res, next) => {

    try {

        const routines = await getAllPublicRoutines();
        res.send(routines);

    } catch (error) {
        next(error);
    }

});

// * POST /api/routines - Passing all tests
routinesRouter.post("/", requireUser, async (req, res, next) => {
    const { id } = req.user;

    req.body.creatorId = id;

    try {

        const newRoutine = await createRoutine(req.body);
        res.send(newRoutine);

    } catch (error) {
        next(error);
    }
});

// * PATCH /api/routines/:routineId - Passing all tests
routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    
    try {
       const routineToUpdate = await getRoutineById(routineId);

       if (routineToUpdate.creatorId === req.user.id) {      

          req.body.id = routineId;
          const updatedRoutine = await updateRoutine(req.body);
          res.send(updatedRoutine);
            
        } else {

            res.status(403);

            next({
                error: "Not authorized to update",
                name: "Not authorized to update",
                message: UnauthorizedUpdateError(req.user.username, routineToUpdate.name)
            });
        }

    } catch(error) {
        next(error);
    }

})

// * DELETE /api/routines/:routineId - Passing all tests
routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
    const { routineId } = req.params;

    try {
        const routineToDelete = await getRoutineById(routineId);

        if (routineToDelete.creatorId === req.user.id) {
        
            const deletedRoutine = await destroyRoutine(routineId);
            res.send(deletedRoutine);

        } else {
      
            res.status(403);

            next({
                error: "Not authorized to delete",
                name: "Not authorized to delete",
                message: UnauthorizedDeleteError(req.user.username, routineToDelete.name)
            });

        }

    } catch (error) {
        next(error);
    }

});

// * POST /api/routines/:routineId/activities - Passing all tests
routinesRouter.post("/:routines/activities", async (req, res, next) => {
    const { routineId, activityId } = req.body;

    try {
        
        const attachedActivity = await addActivityToRoutine(req.body);
        res.send(attachedActivity);

    } catch(error) {
        next({
            error: "Activity already exists on routine",
            name: "Activity already exists on routine",
            message: DuplicateRoutineActivityError(routineId, activityId)
        });
    }

});

module.exports = routinesRouter;
