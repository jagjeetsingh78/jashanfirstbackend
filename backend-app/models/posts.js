const moongoose = require('mongoose');

const PostSchema = moongoose.SchemaType({

    // the schemea needed is the like 
    title:{
        type:String,
        required :true,
        trim:true,
    
    },
   likes: [
    {
        user:{
            type:moongoose.Schema.Types.ObjectId,
            ref:'user',
          
        }
    }
   ],
  

    
   


},{
    timestamps:true,
});

module.exports = moongoose.model('Post', PostSchema);