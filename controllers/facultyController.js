const Faculty = require("../models/facultyModel")

exports.signUp = async (req, res) => {
    try {
      console.log("req",req.body)
      const year = new Date().getFullYear();

    const count = await Faculty.countDocuments();
    const facultyId = `FAC-${year}-${String(count + 1).padStart(3, "0")}`;

        const faculty = await Faculty.create({
      ...req.body,
      facultyId, // ✅ store custom id
    });
        res.status(200).json({
            success: true,
            message: "Faculty Created Successfully",
            faculty: faculty
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error in Creating in Faculty details",
            error: err.message
        })
    }
}

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const faculty = await Faculty.findOne({ email }).select("+password")
        if (!faculty) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await faculty.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = faculty.generateAuthToken();

        res.status(200).json({
            success: true,
            token,
            faculty,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getSingleFaculty = async (req,res)=>{
    try{
const faculty = await Faculty.findOne({ facultyId: req.params.id });

        if(!faculty) {
return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });        }
        res.status(200).json({
success :true,
faculty :faculty
        })
    }catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }
}

exports.updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      data: faculty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faculties.length,
      faculties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

