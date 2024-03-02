const mongoose = require("mongoose");
const CampgroundSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlenght: [50, "Name cannot be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    region: {
      type: String,
      required: [true, "Please add a region"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postal code"],
      maxlenght: [5, "Postalcode cannot be more than 5 digits"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


//Reverse populate with virtuals
CampgroundSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "campground",
  justOne: false,
});

/*
//Cascade delete reservation when campground delete
CampgroundSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Reservation being removed from campground ${this._id}`);
    await this.model("Reservation").deleteMany({ campground: this._id });
    next();
  }
);
*/

module.exports = mongoose.model("Campground", CampgroundSchema);
