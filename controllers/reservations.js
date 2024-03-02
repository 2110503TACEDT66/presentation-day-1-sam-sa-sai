const Reservation = require('../models/Reservation');
const Campground = require('../models/Campground');

//@desc     Get all reserved
//@route    Get /api-infromations/reserved
//@access   Public
exports.getReservations = async (req,res,next) => {
    let query;

    if(req.user.role !== 'admin') {
        query = Reservation.find({user:req.user.id}).populate({
            path: 'campground',
            select: 'name address tel'
        });
    } else {
        if(req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Reservation.find({campground:req.params.campgroundId}).populate({
                path: "campground",
                select: "name address tel",
            });
        } else {
            query = Reservation.find().populate({
                path: 'campground',
                select: 'name address tel'
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false, 
            message: "Cannot find Reservations"
        });
    }
};

//@desc     Get single reserved
//@route    Get /api-infromations/reservations/:id
//@access   Public
exports.getReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'campground',
            select: 'name description tel'
        });

        if(!reservation) {
            return res.status(404).json({success:false, message:`No reservation with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find reservation"});
    }
};

//@desc     Add reserved
//@route    POST /api-infromations/campgrounds/:campgroundId/reservations
//@access   Private
exports.addReservation = async (req,res,next) => {
    try {
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if(!campground) {
            return res.status(404).json({success:false, message:`No campground with the id of ${req.params.campgroundId}`});
        }

        req.body.user = req.user.id;
        const existedReservations = await Reservation.find({user:req.user.id});
        if(existedReservations.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reservations`});
        }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({
            success:true,
            data: reservation
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot create reservation"});
    }
};

//@desc     Update reserved
//@route    PUT /api-infromations/reservations/:id
//@access   Private
exports.updateReservation = async (req,res,next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if(!reservation) {
            return res.status(404).json({success:false, message:`No reservation with the id of ${req.params.id}`});
        }

        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this reservation`});
        }

        if (req.body.user && req.body.user.toString() !== req.user.id.toString()) {
            return res
              .status(400)
              .json({
                success: false,
                message: "Reservation cannot change to other User",
              });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update reservation"});
    }
};

//@desc     Delete reserved
//@route    DELETE /api-infromations/reservations/:id
//@access   Private
exports.deleteReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation) {
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }

        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this reservation`});
        }

        await reservation.deleteOne();

        res.status(200).json({
            success:true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete reservation"});
    }
};