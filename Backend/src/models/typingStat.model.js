import mongoose,{ Schema } from "mongoose";
const typingStatSchema = new Schema(
{
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    wpm:{
        type: Number,
        required: true,
        min: 0
    },
    accuracy:{
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    duration:{
        type: Number, 
        required: true,
        min: 1
    },
    charactersTyped:{
        type: Number,
        required: true,
        min: 1
    },
    testType:{
        type: String,
        enum: ["15s", "30s", "60s", "custom"],
        required: true
    },

    correctChars:{
        type: Number,
        required: true
    },
    incorrectChars:{
        type: Number,
        required: true
    },
    weakKeys: [
       {
            key:{ type: String },
            mistakeCount:{ type: Number }
        }
    ],
    testDate:{
        type: Date,
        default: Date.now,
        index: true
    }
},
{ timestamps: true }
);

export const TypingStat = mongoose.model("TypingStat", typingStatSchema);
