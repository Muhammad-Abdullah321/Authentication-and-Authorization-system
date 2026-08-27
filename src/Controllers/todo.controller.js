import Todo from "../Models/todo.model.js";
import User from "../Models/user.model.js";

 export const createTodo = async (req,res) => {
try{
    //get title and description from req.body
    const {title, description} = req.body

    //check basic validaton 
    if (!title){
      return res.status(400).json({
        mesage:"title is required "
      });
    }

    const user = await User.findById(req.user.id)

    if(!user){
        return res.status(404).json({
            message:"user is not found"
        });
    }

    const dailyLimit = user.plan === "premium" ? 50 : 5;
    
    const startOfDay = new Date();
    startOfDay.setHours( 0 , 0 , 0 , 0 );

    const todayTodos = await Todo.countDocuments({

    userId: req.user.id,

    createdAt: {
        $gte: startOfDay
    }

    });

    if (todayTodos >= dailyLimit) {

    return res.status(403).json({

        message: `Daily limit reached. Your ${user.plan} plan allows only ${dailyLimit} todos per day.`

    });

}

    console.log(req.user);
    console.log(req.user.id); 

    const todo = await Todo.create({
        title,
        description,

        //logged-in user id from auth middleware
        userId: req.user.id
    })

    return res.status(201).json({
        message:"todo create successfully"
    });
    
}catch(error){
    return res.status(500).json({
        message:error.message
    })
}
}

export const getTodo = async (req,res)=>{
    try{
      //find todos of all loged-in users
      const todos = await Todo.find({
        userId: req.user.id
      });

    //   if(!Todo){
    //     return res.status(200).json({
    //         message:"No Todo id present"
    //     })
    //   }

      return res.status(200).json({
        mesage:"Todo fetch successfully",

        todos
      })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            message:error.mesage
        })
    }
}

//update Todo
export const updateTodo =async(req,res)=>{
    try{
     
        const { id } = req.params;

        const { title, description, completed} = req.body;
        
        //find todo
        const todo = await Todo.findById(id);
        
        //check if todo exist
        if (!todo){
            return res.status(404).json({
                mesage:"todo is not found"
            });
        }
          
        //check todo ownership
        if(todo.userId.toString() !== req.user.id){
            return res.status(403).json({
        
            mesage:"you are not allowed to update this todo"
            })
        }

        //update only provided feild 
        if(title !== undefined){
            todo.title=title;
        }

        if(description !== undefined){
            todo.description = description;
        }

        if(completed !== undefined){
            todo.completed = completed;
        }

        //save changes 
        await todo.save

        return res.status(201).json({
            mesage:"todo update successfully",
            todo
        })

    }catch(error){
        console.log(error)
      return res.status(500).json({
        mesage:error.mesage
      })
    }
} 

//delete todo by userid
export const deleteTodo =async(req,res)=>{
    try{
     
        const { id } = req.params;

       
        //find todo
        const todo = await Todo.findById(id);
        
        //check if todo exist
        if (!todo){
            return res.status(404).json({
                mesage:"todo is not found"
            });
        }
          
        //check todo ownership
        if(todo.userId.toString() !== req.user.id){
            return res.status(403).json({
        
            mesage:"you are not allowed to delete this todo"
            })
        }

        await Todo.findByIdAndDelete(id);

        return res.status(200).json({
            message:"record delete successfully"
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            message: error.mesage
        })
    }
}