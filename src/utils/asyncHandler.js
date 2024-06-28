const asyncHandler = (requestHandler) => {
    (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=>nexr(err))
    }
}

export {asyncHandler}


/*
steps for creating a higher order async function :-
 const asyncHandler = () => {}
 const asyncHandler = (func) => () => {}
 const asyncHandler = (func) => async() => {}
 
 all in all we can write,
 const asyncHandler = (func) => async(req, res, next) => {
     try{
         await func(req, res, next)
    }catch(error){
        res.status(error.code || 500).json({
            success : false,
            message : error.message
        })
    }
}
*/