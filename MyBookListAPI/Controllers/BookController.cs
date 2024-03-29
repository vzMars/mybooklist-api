﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyBookListAPI.Dto;
using MyBookListAPI.Interfaces;
using System.Security.Claims;

namespace MyBookListAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IBookRepository _bookRepository;

        public BookController(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<ActionResult<ICollection<BookUserItem>>> GetBooks()
        {
            var books = await _bookRepository.GetBooks();
            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetBookResponse>> GetBook(string id)
        {
            var response = await _bookRepository.GetBook(id, GetUserId());

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpGet("search/{query}")]
        public async Task<ActionResult<ICollection<Volume>>> SearchBooks(string query)
        {
            var books = await _bookRepository.SearchBooks(query);
            return Ok(books);
        }

        [HttpPost]
        public async Task<ActionResult<BookUserResponse>> AddBook(AddBookRequest request)
        {
            var response = await _bookRepository.AddBook(request, GetUserId());

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<BookUserResponse>> UpdateBookStatus(string id, UpdateStatusRequest request)
        {
            var response = await _bookRepository.UpdateBookStatus(id, GetUserId(), request);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<BookUserResponse>> DeleteBook(string id)
        {
            var response = await _bookRepository.DeleteBook(id, GetUserId());

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
    }
}
